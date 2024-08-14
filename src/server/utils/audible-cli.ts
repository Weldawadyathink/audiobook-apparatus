import fs from "node:fs";
import ffmpeg, { type FfprobeData } from "fluent-ffmpeg";
import { spawn } from "node:child_process";

export interface VoucherFile {
  content_license: {
    acr: string;
    asin: string;
    content_metadata: {
      content_reference: {
        acr: string;
        asin: string;
        codec: string;
        content_format: string;
        content_size_in_bytes: number;
        file_version: string;
        marketplace: string;
        tempo: string;
        version: string;
      };
      content_url: {
        offline_url: string;
      };
      last_position_heard: {
        status: string;
      };
    };
    drm_type: string;
    granted_right: string;
    license_id: string;
    license_response: {
      key: string;
      iv: string;
      rules: Array<{
        name: string;
        parameters: Array<{
          expireDate: string;
          type: string;
        }>;
      }>;
    };
    license_response_type: string;
    message: string;
    playback_info: {
      last_position_heard: {
        status: string;
      };
    };
    preview: boolean;
    request_id: string;
    requires_ad_supported_playback: boolean;
    status_code: string;
    voucher_id: string;
  };
  resonse_groups: Array<string>;
}

function getVoucherFileInfo(filename: string): VoucherFile {
  const file = fs.readFileSync(filename, "utf8");
  return JSON.parse(file) as VoucherFile;
}

export function convertAaxc(
  inputFilename: string,
  voucherFilename: string,
  outputFilename: string,
): Promise<{
  command: string;
  inputFilename: string;
  outputFilename: string;
  voucherFilename: string;
  voucherData: VoucherFile;
}> {
  return new Promise((resolve, reject) => {
    let command = "";
    const voucherData = getVoucherFileInfo(voucherFilename);
    ffmpeg()
      .input(inputFilename)
      .inputOption(
        `-audible_key ${voucherData.content_license.license_response.key}`,
      )
      .inputOption(
        `-audible_iv ${voucherData.content_license.license_response.iv}`,
      )
      .outputOption("-codec copy")
      .on("error", (err) => {
        console.log(`Command: ${command}`);
        console.log(`Some error occurred: ${err.message}`);
        reject(err);
      })
      .on("end", () => {
        resolve({
          command: command,
          inputFilename: inputFilename,
          outputFilename: outputFilename,
          voucherFilename: voucherFilename,
          voucherData: voucherData,
        });
      })
      .on("start", (com) => (command = com))
      .save(outputFilename);
  });
}

export function convertAax(
  inputFilename: string,
  outputFilename: string,
  activationBytes: string,
): Promise<{
  command: string;
  activationBytes: string;
  inputFilename: string;
  outputFilename: string;
}> {
  return new Promise((resolve, reject) => {
    let command = "";
    ffmpeg()
      .input(inputFilename)
      .inputOption(`-activation_bytes ${activationBytes}`)
      .outputOption("-codec copy")
      .on("error", (err) => {
        console.log(`Command: ${command}`);
        console.log(`Some error occurred: ${err.message}`);
        reject(err);
      })
      .on("end", () => {
        resolve({
          command: command,
          activationBytes: activationBytes,
          inputFilename: inputFilename,
          outputFilename: outputFilename,
        });
      })
      .on("start", (com) => (command = com))
      .save(outputFilename);
  });
}

export function ffprobe(filename: string): Promise<FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filename, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

export function getLibrary(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let asinList: string[] = [];
    const process = spawn("audible", ["library", "list"]);

    process.stdout.on("data", (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const lines = data.toString().split("\n") as string[];
      const asins = lines.map((row: string) => row.substring(0, 10));
      asinList = [...asinList, ...asins];
    });

    process.stderr.on("data", (data) => {
      reject(data);
    });

    process.on("close", (code) => {
      if (code == 0) {
        resolve(asinList.filter((s) => s !== ""));
      } else {
        reject(`Process exited with code ${code}`);
      }
    });
  });
}

export function downloadItem(
  asin: string,
  folderName: string,
  progressFunction?: (data: {
    percent: number;
    downloadSize: string | undefined;
    totalSize: string | undefined;
    speed: string | undefined;
  }) => void,
): Promise<{
  percent: number;
  downloadSize: string | undefined;
  totalSize: string | undefined;
  speed: string | undefined;
  voucherFilename: string | undefined;
  filename: string;
}> {
  return new Promise((resolve, reject) => {
    let percent = 0;
    let downloadSize: string | undefined = undefined;
    let totalSize: string | undefined = undefined;
    let speed: string | undefined = undefined;
    let voucherFilename: string | undefined = undefined;
    let filename: string | undefined = undefined;

    const newEnv = process.env;
    newEnv.PYTHONUNBUFFERED = "true";
    const audible = spawn(
      "audible",
      [
        "download",
        "--asin",
        asin,
        "--aax-fallback",
        "--output-dir",
        folderName,
        "--no-confirm",
        "--overwrite",
      ],
      { stdio: ["ignore", "pipe", "pipe"], env: newEnv },
    );

    audible.stdout.on("data", (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const str = data.toString() as string;
      const voucher = /Voucher file saved to (.*)./.exec(str);
      if (voucher) {
        voucherFilename = voucher[1];
      }

      const filenameRegex = /File (.*) downloaded in .*/.exec(str);
      if (filenameRegex) {
        filename = filenameRegex[1];
      }
    });

    audible.stderr.on("data", (data) => {
      // tqdm prints to stderr for some reason

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      const str: string = data.toString() as string;
      const newPercentStr = /(\d{1,3})%\|/.exec(str)?.[1];
      if (!newPercentStr) {
        return;
      }
      const newPercent = parseInt(newPercentStr);

      const newSpeed = /[\d.]+.B\/s/.exec(str)?.[0];
      const downloadSizeRegex = /([\d.]+.?)\/([\d.]+.?)/.exec(str);
      const newDownloadSize = downloadSizeRegex?.[1];
      const newTotalSize = downloadSizeRegex?.[2];

      if (newPercent > percent) {
        // prevent out of order message processing

        percent = newPercent;
        speed = newSpeed;
        downloadSize = newDownloadSize;
        totalSize = newTotalSize;

        if (progressFunction) {
          progressFunction({
            percent: percent,
            downloadSize: downloadSize,
            totalSize: totalSize,
            speed: speed,
          });
        }
      }
    });

    audible.on("close", (code) => {
      if (code == 0) {
        if (!filename) {
          reject(
            new Error(
              `Download filename was missing. This should not be possible.`,
            ),
          );
          return;
        }
        resolve({
          percent: percent,
          downloadSize: downloadSize,
          totalSize: totalSize,
          speed: speed,
          voucherFilename: voucherFilename,
          filename: filename,
        });
      } else {
        reject(new Error(`Audible-cli exited with code ${code}`));
      }
    });
  });
}
