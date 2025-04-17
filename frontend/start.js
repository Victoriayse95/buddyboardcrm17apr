// start.js
const { exec } = require('child_process');
const port = process.env.PORT || 3000;

// Start the Next.js server
exec(`npx next start -p ${port}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
}); 