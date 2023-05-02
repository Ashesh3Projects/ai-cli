import fs from "fs-extra";
import path from "path";
import { IModel } from "../types";

export const defaultModel = {
  name: "text-davinci-003",
};

export const models: IModel[] = [
  defaultModel,
  { name: "text-curie-001" },
  { name: "text-ada-001" },
  { name: "text-babbage-001" },
  { name: "code-davinci-002", isLimitedBeta: true },
  { name: "code-cushman-001", isLimitedBeta: true },
];

export const getOpenAIKey = async (
  configDir: string
): Promise<string | null> => {
  const filePath = getAPIConfigFilePath(configDir);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const lines = fileContent?.split("\n") || [];
    for (const line of lines) {
      const [name, value] = line.split("=");
      if (name === "OPENAI_API_KEY") {
        return value.trim();
      }
    }
  }
  return null;
};


export const getOpenAIBasePath = async (
  configDir: string
): Promise<string | null> => {
  const filePath = getAPIConfigFilePath(configDir);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const lines = fileContent?.split("\n") || [];
    for (const line of lines) {
      const [name, value] = line.split("=");
      if (name === "OPENAI_BASE_PATH") {
        return value.trim();
      }
    }
  }
  return null;
};


export const getAPIConfigFilePath = (configDir: string): string =>
  path.join(configDir, ".ai-cli");

const getDataConfigFilePath = (dataDir: string): string =>
  path.join(dataDir, "config.json");

export const getCurrentModel = (dataDir: string): typeof models[number] => {
  const config = getDataConfigFilePath(dataDir);
  const exists = fs.existsSync(config);
  if (!exists) {
    saveModelPreference(dataDir, defaultModel);
  }
  const { model } = fs.readJsonSync(config);
  return model;
};

export const saveModelPreference = (dataDir: string, model: IModel): void => {
  const config = getDataConfigFilePath(dataDir);
  fs.writeJsonSync(config, { model });
};

// Directly from - https://github.com/abhagsain/ai-cli/issues/9#issuecomment-1324016570
const getPowerShellPrompt = () =>
  `Correctly answer the asked question. Return 'Sorry, Can't answer that. (insert the reason here)' if the question isn't related to technology. Provide the correct powershell command and just send me the command so that I can directly execute it.

Q - get into a docker container.
A - \`docker exec -it <container>\`

Q - Check what's listening on a port.
A - \`netstat -ano | findstr :<port>\`

Q - How to ssh into a server with a specific file.
A - \`ssh -i <file_path> <user>@<port>\`

Q - How to set relative line numbers in vim.
A - \`:set relativenumber\`

Q - How to create alias?
A - \`Set-Alias <new_command> <old_command>\`

Q - Tail docker logs.
A - \`docker logs -f mongodb\`

Q - Forward port in kubectl.
A - \`kubectl port-forward <pod_name> 8080:3000\`

Q - Check if a port is accessible.
A - \`Test-NetConnection -ComputerName <host_name> -Port <port>\`

Q - Kill a process running on port 3000.
A - \`Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process\`      

Q - Capital city of Ukrain?
A - Sorry, Can't answer that. It's related to geography.

Q - Powershell command to `;
const getUnixPrompt = () =>
  `Correctly answer the asked question. Return 'Sorry, Can't answer that. (insert the reason here)' if the question isn't related to technology. Provide the correct bash command and just send me the command so that I can directly execute it.

Q - get into a docker container.
A - \`docker exec -it <container>\`

Q - Check what's listening on a port.
A - \`lsof -i tcp:<port>\`

Q - How to ssh into a server with a specific file.
A - \`ssh -i <file_path> <user>@<port>\`

Q - How to set relative line numbers in vim.
A - \`:set relativenumber\`

Q - How to create alias?
A - \`alias my_command="my_real_command"\`

Q - Tail docker logs.
A - \`docker logs -f mongodb\`

Q - Forward port in kubectl.
A - \`kubectl port-forward <pod_name> 8080:3000\`

Q - Check if a port is accessible.
A - \`nc -vz host port\`

Q - Recursively remove a folder.
A - \`rm -rf <folder_name>\`      

Q - Capital city of Ukrain?
A - Sorry, Can't answer that. It's related to geography.

Q - Bash command to `;

export const getDefaultCommandPrompt = (): string => {
  const platform = process.platform;

  switch (platform) {
    case "win32":
      return getPowerShellPrompt();

    default:
      return getUnixPrompt();
  }
};
