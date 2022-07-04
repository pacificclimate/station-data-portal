# Station Data Portal

Frontend for visualizing and selecting stations, and downloading station 
data from a 
[PyCDS](https://github.com/pacificclimate/pycds) / CRMP schema database. 

## Documentation

- [Functionality](docs/developer/functionality.md)
- [Dependencies](docs/developer/dependencies.md)
- [Installation](docs/developer/installation.md)
- [Configuration](docs/developer/configuration.md)
- [Development and testing](docs/developer/development.md)
- [Production](docs/developer/production.md)
- [User documentation](docs/developer/user-doc.md)
- [Project initialization](docs/developer/Project-initialization.md)

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

**Note**: When a new release of this portal is deployed, also create a new 
release of the PDP and deploy it. This will cause the updated documentation 
for this portal to be included in the PDP
documentation. For more details, see [User documentation](docs/developer/user-doc.md).