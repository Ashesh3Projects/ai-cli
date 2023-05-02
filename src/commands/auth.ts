import { Command } from "@oclif/core";
import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import { getAPIConfigFilePath, getOpenAIKey } from "../helpers/index";

export default class Auth extends Command {
  static description = "Update existing or add new OpenAI API Key";

  static examples = ["<%= config.bin %> <%= command.id %> (Follow the prompt)"];

  public async run(): Promise<void> {
    const existingAPIKey = await getOpenAIKey(this.config.configDir);
    const filePath = getAPIConfigFilePath(this.config.configDir);

    const message = existingAPIKey
      ? "Please enter your OpenAI API Key (This would overwrite the existing key)"
      : "Please enter your OpenAI API Key";
    const prompt = await inquirer.prompt([
      {
        name: "userAPIKey",
        message,
        type: "password",
        validate: (value: string) => {
          if (!value.trim()) {
            return "Please enter a valid API key";
          }
          return true;
        },
      },
    ]);

    const { userAPIKey } = prompt;
    this.log(`API Key is saved at ${chalk.bold.yellowBright(filePath)}`);

    const message2 = "Please enter your OpenAI Base Path";
    const prompt2 = await inquirer.prompt([
      {
        name: "userBasePath",
        message2,
        type: "password",
        validate: (value: string) => {
          if (!value.trim()) {
            return "Please enter a valid base path";
          }
          return true;
        },
      },
    ]);

    const { userBasePath } = prompt2;
    fs.ensureFileSync(filePath);
    
    if (userAPIKey && userBasePath) {
      fs.writeFileSync(filePath, `OPENAI_API_KEY=${userAPIKey}\nOPENAI_BASE_PATH=${userBasePath}`);
    }


  }
}
