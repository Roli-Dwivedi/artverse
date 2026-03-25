import sys
print("Python executable:", sys.executable)
print("Current dir:", sys.path[0])
print("Path:", sys.path)

import app
print("app module location:", app.__file__)
print("Names in app:", dir(app))
