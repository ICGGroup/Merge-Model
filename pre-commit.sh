#!/bin/sh

git stash -q --keep-index

grep ./test/spec/**/*.coffee -e "\.skip"

GREP_COLOR='4;5;37;41' 

if grep ./test/spec/**/*.coffee -e "\.only"
then
  git stash pop -q
  echo "Commit aborted.  Please remove .only calls from specs/"
  exit 1
else
  
  if yeoman test
  then
    git stash pop -q
    exit 0
  else
    git stash pop -q
    echo "Commit aborted.  Failed Tests."
    exit 1
  fi    
fi

# Clean up tests.
