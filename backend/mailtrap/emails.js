import { mailtrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email ,name, verificationToken)=>{
    const recipient = [{email}]
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "233734ef-5b22-42ad-9a39-0ac073320fdf",
            template_variables: {
              "company_info_name": "Welloo",
              "name": name,
              "verification-code":verificationToken
            }})
            console.log('email sent successfully' , response)
    } catch (error) {
        console.log(error)
        throw new Error(`error while sending email ${error}`)
        
    }

}

export const sendWelcomEmail = async (name , email)=>{
    const recipient = [{email}]
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "5530bbef-83dc-46fd-9739-019ad09f87b0",
            template_variables: {
              company_info_name: "Wello",
              name: name
            }
          })
          console.log('email sent successfully' , response)
        
    } catch (error) {
        console.log(error)
        throw new Error(`error while sending email ${error}`)
  
    }

}

export const sendPasswordResetEmail =async (email , resetURL)=>{
    const recipient = [{email}]
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "390804c8-dd6a-486a-a891-09ab0df954dd",
            template_variables: {
              company_info_name: "Wello",
              resetPassword:resetURL 
            }
          })
          console.log('email sent successfully' , response)
        
    } catch (error) {
        console.log(error)
        throw new Error(`error while sending email ${error}`)
  
    }

}

export const sendResetPasswordEmail = async (email)=>{
    const recipient = [{email}]
    try {

        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "0e6524f7-f94c-4514-a7c1-d3141af99dc4",
            template_variables: {
              company_info_name: "Welloo",
            }
          })
          console.log(response)
        
    } catch (error) {
        console.log(error)
        throw new Error(`error while sending email ${error}`)        
    }

}