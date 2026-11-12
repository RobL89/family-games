"""A stand-in shared/config.js for the browser tests, so they never need the real grown-ups' answer.

The tests serve this instead of the repo's config.js (Playwright route). It is the repo's file with
the grown-ups' hash swapped for the hash of TEST_ANSWER and, if asked, every feature switch set.
The app itself is not changed.
"""
import hashlib
import os
import re

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TEST_ANSWER = 'test answer'
CONFIG_ROUTE = re.compile(r'.*/shared/config\.js(\?.*)?$')


def config_js(features=None):
    """The repo's config.js with the test answer's hash, and features all True or all False if given."""
    with open(os.path.join(REPO, 'shared', 'config.js'), encoding='utf-8') as f:
        text = f.read()
    salt = re.search(r"salt: '([0-9a-f]+)'", text).group(1)
    iterations = int(re.search(r'iterations: (\d+)', text).group(1))
    normal = re.sub(r'[^a-z0-9]', '', TEST_ANSWER.lower())
    digest = hashlib.pbkdf2_hmac('sha256', normal.encode(), salt.encode(), iterations).hex()
    text, n = re.subn(r"hash: '[0-9a-f]+'", f"hash: '{digest}'", text)
    assert n == 1, 'config.js: no single grown-ups hash'
    if features is not None:
        value = 'true' if features else 'false'
        text, n = re.subn(r'(\n    \w+: )(true|false)(,\s+//)', lambda m: m.group(1) + value + m.group(3), text)
        assert n == 6, f'config.js: expected the six feature switches, found {n}'
    return text


def route_config(ctx, features=None):
    """Serve the test config.js to every page in this browser context."""
    body = config_js(features)
    ctx.route(CONFIG_ROUTE, lambda route: route.fulfill(status=200, content_type='text/javascript', body=body))
