# Block & Sound — GitHub Pages

This repository contains a framework-free static version of the Block & Sound
phonics game. GitHub Pages can publish it directly; no build command, database,
or API key is required.

The recorded phonics files and their processing notes are documented in
[`audio/README.md`](audio/README.md).

## Upload through the GitHub website

1. On GitHub, create a new **public** repository named
   `block-and-sound-phonics`.
2. Leave **Add a README**, `.gitignore`, and license unchecked when creating it.
3. In the empty repository, choose **uploading an existing file**.
4. Upload every file from this local folder and commit the upload.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, select **Deploy from a branch**.
7. Select the `main` branch and `/(root)`, then click **Save**.

The site will appear at:

`https://YOUR-USERNAME.github.io/block-and-sound-phonics/`

Replace `YOUR-USERNAME` with your GitHub username. The first deployment can
take a few minutes.

## Upload with Git

After creating the empty public repository on GitHub, run:

```bash
cd "/Users/zhuo/Documents/phonic game/block-and-sound-pages"
git remote add origin https://github.com/YOUR-USERNAME/block-and-sound-phonics.git
git push -u origin main
```

Then enable Pages from the `main` branch and `/(root)` in the repository's
**Settings → Pages** screen.

## Update the website later

Replace the changed files, commit them, and push `main` again. GitHub Pages will
publish the new version automatically.
