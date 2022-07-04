# User documentation

This app is part of the 
[PCIC Data Portal](https://github.com/pacificclimate/pdp), 
and as such its user documentation
is integrated within the larger set of PDP documentation.

This app's user documentation is maintained _in this repo_ and is copied
over (from GitHub) each time the PDP documentation is built. This allows
the user documentation to be maintained in lockstep with code updates
in this repo.

Note: The PDP is a Python project; therefore its documentation is coded in
rST (reStructuredText); therefore the documentation for this portal
must also be coded in rST. This is a bit foreign to a JS project, but
it gives an excellent result.

All user documentation is contained in the directory 
[`./docs/user`](../user) in this repo.
Briefly, that directory contains one or more rST files, 
any accompanying images or other supporting files, and a manifest 
(`manifest.yaml`) that tells PDP what files to copy. For more details,
see the README on this topic in the PDP repo.

The procedure for updating the documentation for this portal is:
1. Update documentation files in `user-doc`.
2. Update `user-doc/manifest.yaml` if necessary.
3. Merge the branch/PR on which these changes are made.
4. When a new release of this portal is deployed, also do the following:
   In the PDP repo, create a new release and deploy it. This causes the
   PDP documentation to be rebuilt, which will include changes to this 
   portal's documentation.

