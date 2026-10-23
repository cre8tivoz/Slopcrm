"""Deploy only Slopcrm's static export using the WDL folder-locked FTPS login.

No deletes, root-site writes, plaintext FTP or disabled certificate verification.
Assets precede pages; the release marker is last. Every public file is read back
via HTTPS and byte-checked. Revert the source commit to roll back through CI.
"""
import concurrent.futures
import ftplib
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import ssl
import urllib.parse
import urllib.request

TARGET = '/slopcrm'
PUBLIC_URL = 'https://witchdaddylabs.com/slopcrm/'


def remote_path(relative):
    path = PurePosixPath(relative)
    if (not relative or path.is_absolute() or '\\' in relative
            or any(ord(c) < 32 or ord(c) == 127 for c in relative)
            or any(part.startswith('.') for part in path.parts)
            or path.suffix.lower() in {'.pem', '.key'}):
        raise ValueError(f'Unsafe deploy path: {relative!r}')
    return f'{TARGET}/{path.as_posix()}'


def collect_files(folder):
    home = folder / 'index.html'
    if not home.is_file() or '/slopcrm/_next/' not in home.read_text():
        raise ValueError('Missing static export or incorrect base path; build with NEXT_PUBLIC_BASE_PATH=/slopcrm.')
    files = []
    for path in folder.rglob('*'):
        if path.is_symlink():
            raise ValueError(f'Symlink in build: {path.name}')
        if path.is_file():
            remote_path(path.relative_to(folder).as_posix())
            files.append(path)
    return files


def upload(ftp, folder, files):
    # This folder must already exist in the WDL FTP account's locked root.
    # Fail instead of guessing another docroot or creating a new deployment root.
    ftp.cwd(TARGET)
    directories = sorted({parent.as_posix() for path in files for parent in path.relative_to(folder).parents if parent != Path('.')}, key=lambda p: (p.count('/'), p))
    for directory in directories:
        target = remote_path(directory)
        try:
            ftp.cwd(target)
        except ftplib.error_perm:
            ftp.mkd(target)
    ftp.cwd(TARGET)
    def order(path):
        relative = path.relative_to(folder).as_posix()
        return (2 if relative == 'deployment.json' else 1 if path.suffix == '.html' else 0, relative == 'index.html', relative)
    for path in sorted(files, key=order):
        target = remote_path(path.relative_to(folder).as_posix())
        with path.open('rb') as stream:
            ftp.storbinary(f'STOR {target}', stream)
        if ftp.size(target) != path.stat().st_size:
            raise RuntimeError(f'Uploaded file size mismatch: {path.relative_to(folder)}')


def live_bytes(relative):
    url = PUBLIC_URL + urllib.parse.quote(relative, safe='/')
    request = urllib.request.Request(url, headers={'User-Agent': 'Slopcrm deploy verification', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def verify_live(folder, files, fetch=live_bytes):
    def check(path):
        relative = path.relative_to(folder).as_posix()
        if fetch(relative) != path.read_bytes():
            raise RuntimeError(f'Live file does not match this build: {relative}')
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(check, files))
    return len(files)


def main():
    if os.environ.get('GITHUB_REPOSITORY', '').lower() != 'cre8tivoz/slopcrm' or os.environ.get('GITHUB_REF') != 'refs/heads/main':
        raise RuntimeError('Production deploy is restricted to cre8tivoz/Slopcrm main.')
    commit = os.environ.get('GITHUB_SHA', '')
    if not re.fullmatch('[0-9a-f]{40}', commit):
        raise RuntimeError('Missing or invalid source commit.')
    credentials = {key: os.environ.get(key, '') for key in ['WDL_FTP_HOST', 'WDL_FTP_USER', 'WDL_FTP_PASS']}
    if not all(credentials.values()):
        raise RuntimeError('Add WDL_FTP_HOST, WDL_FTP_USER and WDL_FTP_PASS to this repository Actions secrets using the existing WDL FTP login.')
    folder = Path('out').resolve()
    files = collect_files(folder)
    marker = folder / 'deployment.json'
    marker.write_text(json.dumps({'commit': commit, 'repository': 'cre8tivoz/Slopcrm', 'basePath': TARGET,
        'files': {p.relative_to(folder).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in files if p != marker}}, sort_keys=True) + '\n')
    files = collect_files(folder)
    with ftplib.FTP_TLS(context=ssl.create_default_context()) as ftp:
        ftp.connect(credentials['WDL_FTP_HOST'], 21, timeout=60)
        ftp.login(credentials['WDL_FTP_USER'], credentials['WDL_FTP_PASS'])
        ftp.prot_p()
        ftp.voidcmd('TYPE I')
        upload(ftp, folder, files)
    count = verify_live(folder, files)
    print(f'Deployed {commit} to {PUBLIC_URL}; {count} files match over HTTPS. No remote files deleted.')


if __name__ == '__main__':
    main()
