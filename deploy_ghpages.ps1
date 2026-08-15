# Create a temporary directory
$TempDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP "gh-pages-deploy") -Force
# Copy build files to temp dir
Copy-Item -Path "frontend\build\*" -Destination $TempDir -Recurse -Force

# Checkout gh-pages
git checkout --orphan gh-pages
git rm -rf .

# Copy files back
Copy-Item -Path "$TempDir\*" -Destination . -Recurse -Force

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# Cleanup and go back to main
git checkout main
git branch -D gh-pages
Remove-Item -Recurse -Force $TempDir
