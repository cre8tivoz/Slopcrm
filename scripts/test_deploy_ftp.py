import importlib.util
import ftplib
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('deploy_ftp', Path(__file__).with_name('deploy_ftp.py'))
assert spec is not None and spec.loader is not None
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)


class FakeFTP:
    def __init__(self):
        self.files = {}
        self.uploaded = []
        self.visited = []
        self.directories = {'/slopcrm'}
    def cwd(self, path):
        if path not in self.directories:
            raise ftplib.error_perm('550 No such directory')
        self.visited.append(path)
    def mkd(self, path):
        if str(Path(path).parent) not in self.directories:
            raise ftplib.error_perm('550 Parent missing')
        self.directories.add(path)
        self.visited.append(path)
    def storbinary(self, command, stream):
        path = command.removeprefix('STOR ')
        if str(Path(path).parent) not in self.directories:
            raise ftplib.error_perm('550 Parent missing')
        self.files[path] = stream.read()
        self.uploaded.append(path)
    def size(self, path):
        return len(self.files[path])


class DeployTests(unittest.TestCase):
    def test_all_remote_paths_stay_in_slopcrm(self):
        self.assertEqual(deploy.remote_path('_next/static/app.js'), '/slopcrm/_next/static/app.js')
        self.assertEqual(deploy.remote_path('index.html'), '/slopcrm/index.html')

    def test_path_escape_and_credential_files_rejected(self):
        for path in ['../index.html', '/index.html', 'a/../../index.html', '.env', '.git/config', 'folder/.env.local', 'private.pem', 'a\\index.html', 'a\nindex.html']:
            with self.subTest(path=path), self.assertRaises(ValueError):
                deploy.remote_path(path)

    def test_wrong_base_path_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            Path(folder, 'index.html').write_text('<script src="/_next/app.js"></script>')
            with self.assertRaises(ValueError):
                deploy.collect_files(Path(folder))

    def test_missing_build_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder, self.assertRaises(ValueError):
            deploy.collect_files(Path(folder))

    def test_symlinks_are_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'index.html').write_text('<script src="/slopcrm/_next/app.js"></script>')
            (root / 'linked.txt').symlink_to(root / 'index.html')
            with self.assertRaises(ValueError):
                deploy.collect_files(root)

    def test_assets_uploaded_before_pages_and_release_marker_last(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for name in ['index.html', 'app.js', 'deployment.json']:
                (root / name).write_text(name)
            files = [root / n for n in ['index.html', 'deployment.json', 'app.js']]
            ftp = FakeFTP()
            deploy.upload(ftp, root, files)
            self.assertEqual(ftp.uploaded, ['/slopcrm/app.js', '/slopcrm/index.html', '/slopcrm/deployment.json'])
            self.assertTrue(all(p.startswith('/slopcrm') for p in ftp.visited))

    def test_failed_size_check_fails_the_deploy(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'index.html').write_text('content')
            ftp = FakeFTP()
            ftp.size = lambda path: 0
            with self.assertRaises(RuntimeError):
                deploy.upload(ftp, root, [root / 'index.html'])

    def test_all_missing_ancestor_directories_are_created(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            asset = root / '_next/static/build-id/chunks/main.js'
            asset.parent.mkdir(parents=True)
            asset.write_text('bundle')
            ftp = FakeFTP()
            deploy.upload(ftp, root, [asset])
            self.assertEqual(ftp.files['/slopcrm/_next/static/build-id/chunks/main.js'], b'bundle')
            self.assertTrue({'/slopcrm/_next', '/slopcrm/_next/static', '/slopcrm/_next/static/build-id', '/slopcrm/_next/static/build-id/chunks'} <= ftp.directories)

    def test_live_content_must_match_bytes_not_just_size(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'index.html').write_text('right')
            with self.assertRaises(RuntimeError):
                deploy.verify_live(root, [root / 'index.html'], lambda _: b'wrong')
            self.assertEqual(deploy.verify_live(root, [root / 'index.html'], lambda _: b'right'), 1)


if __name__ == '__main__':
    unittest.main()
