# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import subprocess
import requests

from git import Repo
from github import Auth


def clone_repo(repo_name: str, github_account: str):
    try:
        github_app_id = os.environ["GITHUB_APP_ID"]
        github_installation_id = os.environ["GITHUB_APP_INSTALLATION_ID"]
        private_key = os.environ["GITHUB_APP_PRIVATE_KEY"]

        auth = Auth.AppAuth(
            github_app_id,
            private_key,
        )

        jwt_token = auth.create_jwt()

        response = requests.post(
            f"https://api.github.com/app/installations/{github_installation_id}/access_tokens",
            headers={
                "Authorization": f"Bearer {jwt_token}",
                "Accept": "application/vnd.github+json",
            },
        )

        installation_token = response.json()["token"]

        repo = Repo.clone_from(
            f"https://x-access-token:{installation_token}@github.com/{github_account}/{repo_name}.git",
            repo_name,
        )

        print(repo.branches)

        subprocess.run(["ls", "-l", repo_name])
    except Exception as e:
        print(f"Error cloning repository: {e}")
        return


def main():
    github_account = os.environ["GITHUB_ACCOUNT"]
    repo_name = os.environ["REPO_NAME"]

    print("Running workflow step", os.environ["WORKFLOW_STEP"])
    print("Account name:", github_account)
    print("Repo name:", repo_name)

    clone_repo(repo_name, github_account)


if __name__ == "__main__":
    main()
