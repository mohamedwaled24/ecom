import dotenv from 'dotenv'
dotenv.config();

import  { MailtrapClient } from "mailtrap";



const TOKEN =MAILTRAP_TOKEN;



export const mailtrapClient = new MailtrapClient({
  token:TOKEN
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Mohamed waled",
};
