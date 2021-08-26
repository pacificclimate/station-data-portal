# Station Data Portal

Frontend for visualizing and selecting stations, and downloading station 
data from a 
[PyCDS](https://github.com/pacificclimate/pycds) / CRMP schema database. 

## Documentation

- [Requirements](docs/requirements.md)
- [Installation](docs/installation.md)
- [Configuration](docs/configuration.md)
- [Development](docs/development.md)
- [Production](docs/production.md)
- [Project initialization](docs/Project-initialization.md)

## Releasing

To create a versioned release:

1. Increment `version` in `package.json`
2. Summarize the changes from the last version in `NEWS.md`
3. Commit these changes, then tag the release:

  ```bash
git add package.json NEWS.md
git commit -m"Bump to version x.x.x"
git tag -a -m"x.x.x" x.x.x
git push --follow-tags
  ```