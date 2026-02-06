const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const COMPILER_PATH = path.resolve(__dirname, '../../build/cook');
const OUT_ASM = 'out.asm'; // Compiler generates this in CWD
const OUT_EXEC = './out'; // Compiler generates this in CWD

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client/dist')));

app.post('/compile', (req, res) => {
    const { code } = req.body;
    
    // Create a unique temporary directory for this request
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const tempDir = path.resolve(os.tmpdir(), `cook_compile_${uniqueId}`);
    
    try {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const tempFile = path.join(tempDir, 'temp.cook');
        fs.writeFileSync(tempFile, code);

        // Run compiler with cwd = tempDir
        exec(`${COMPILER_PATH} ${tempFile}`, { cwd: tempDir }, (error, stdout, stderr) => {
            if (error || stderr) {
                // Compilation failed
                const errorMsg = stderr || error.message;
                cleanup(tempDir);
                return res.json({
                    success: false,
                    output: '',
                    assembly: '',
                    errors: errorMsg
                });
            }

            // Compilation success - Read assembly
            let assembly = '';
            try {
                assembly = fs.readFileSync(path.join(tempDir, OUT_ASM), 'utf-8');
            } catch (e) {
                assembly = '; Assembly file not found.';
            }

            // Run the executable
            exec(OUT_EXEC, { cwd: tempDir }, (runError, runStdout, runStderr) => {
                const output = runStdout + runStderr;
                let runtimeError = null;

                if (runError && runError.code !== undefined && !runStderr) {
                     // Non-zero exit is fine
                } else if (runError) {
                    runtimeError = runStderr || runError.message;
                }

                res.json({
                    success: !runtimeError,
                    output: output,
                    assembly: assembly,
                    errors: runtimeError ? `Runtime Error:\n${runtimeError}` : ''
                });

                cleanup(tempDir);
            });
        });
    } catch (err) {
        console.error("Server Error:", err);
        cleanup(tempDir);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function cleanup(dir) {
    try {
        fs.rmSync(dir, { recursive: true, force: true });
    } catch (e) {
        console.error(`Failed to cleanup temp dir ${dir}:`, e);
    }
}

// Catch-all route for SPA
app.get(/^(?!\/compile).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
