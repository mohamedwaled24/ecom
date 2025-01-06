import dotenv from 'dotenv'
dotenv.config();

import  { MailtrapClient } from "mailtrap";



const TOKEN ="b15ea0ecfb035e078587faa94c7bd3db";



export const mailtrapClient = new MailtrapClient({
  token:TOKEN
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Mohamed waled",
};
