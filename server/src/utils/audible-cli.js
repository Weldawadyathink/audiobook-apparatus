import fs from "node:fs";
import ffmpeg from "fluent-ffmpeg";
import { spawn } from "node:child_process";
function getVoucherFileInfo(filename) {
    const file = fs.readFileSync(filename, "utf8");
    return JSON.parse(file);
}
export function convertAaxc(inputFilename, voucherFilename, outputFilename) {
    return new Promise((resolve, reject) => {
        let command = "";
        const voucherData = getVoucherFileInfo(voucherFilename);
        ffmpeg()
            .input(inputFilename)
            .inputOption(`-audible_key ${voucherData.content_license.license_response.key}`)
            .inputOption(`-audible_iv ${voucherData.content_license.license_response.iv}`)
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
export function convertAax(inputFilename, outputFilename, activationBytes) {
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
export function ffprobe(filename) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filename, (err, metadata) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(metadata);
            }
        });
    });
}
export function getLibrary() {
    return new Promise((resolve, reject) => {
        let asinList = [];
        const process = spawn("audible", ["library", "list"]);
        process.stdout.on("data", (data) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            const lines = data.toString().split("\n");
            const asins = lines.map((row) => row.substring(0, 10));
            asinList = [...asinList, ...asins];
        });
        process.stderr.on("data", (data) => {
            reject(data);
        });
        process.on("close", (code) => {
            if (code == 0) {
                resolve(asinList.filter((s) => s !== ""));
            }
            else {
                reject(`Process exited with code ${code}`);
            }
        });
    });
}
export function downloadItem(asin, folderName, progressFunction) {
    return new Promise((resolve, reject) => {
        let percent = 0;
        let downloadSize = undefined;
        let totalSize = undefined;
        let speed = undefined;
        let voucherFilename = undefined;
        let filename = undefined;
        const progressFunctionPromises = [];
        const newEnv = process.env;
        newEnv.PYTHONUNBUFFERED = "true";
        const audible = spawn("audible", [
            "download",
            "--asin",
            asin,
            "--aax-fallback",
            "--output-dir",
            folderName,
            "--no-confirm",
            "--overwrite",
        ], { stdio: ["ignore", "pipe", "pipe"], env: newEnv });
        audible.stdout.on("data", (data) => {
            const str = data.toString();
            const voucher = /Voucher file saved to (.*)./.exec(str);
            if (voucher) {
                voucherFilename = voucher[1];
            }
            const filenameRegex = /File (.*) downloaded in .*/.exec(str);
            if (filenameRegex) {
                filename = filenameRegex[1];
            }
            if (str == "No new files downloaded.\n") {
                reject(new Error(`Download failed. Safe to retry.`));
            }
        });
        audible.stderr.on("data", (data) => {
            // tqdm prints to stderr for some reason
            const str = data.toString();
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
                    progressFunctionPromises.push(progressFunction({
                        percent: percent,
                        downloadSize: downloadSize,
                        totalSize: totalSize,
                        speed: speed,
                    }));
                }
            }
        });
        audible.on("close", (code) => {
            // Ensure the resolution happens after all other promises are settled
            void Promise.allSettled(progressFunctionPromises).then(() => {
                if (code == 0) {
                    if (filename === undefined) {
                        reject(
                        // Sometimes audible-cli download returns "No new files downloaded."
                        // That case should be handled elsewhere.
                        new Error(`Download filename was missing. This should not be possible.`));
                    }
                    else {
                        resolve({
                            percent: percent,
                            downloadSize: downloadSize,
                            totalSize: totalSize,
                            speed: speed,
                            voucherFilename: voucherFilename,
                            filename: filename,
                        });
                    }
                }
                else {
                    reject(new Error(`Audible-cli exited with code ${code}`));
                }
            });
        });
    });
}
