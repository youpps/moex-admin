pm2 delete moex-admin
npx tsc
pm2 start index.js --name moex-admin