import info from "package-info";
import packageInfo from "../../package.json" assert { type: "json" };

export default async (argv) => {
  const localVersion = packageInfo.version;
  const remoteVersion = await info("ez-discord.js");

  console.log(`Local version: ${localVersion}`);
  console.log(`Remote version: ${remoteVersion.version}`);

  if (localVersion === remoteVersion.version) {
    console.log("You are up to date!");
  } else {
    console.log("You are not up to date!");
  }
};
