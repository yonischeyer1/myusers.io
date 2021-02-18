import ServiceStore from '../services /store.service'

export interface Account {
    id?:string
    name:string,
    loginURL:string
}

const serviceStore = new ServiceStore();

export const createAndSaveAccount = (currentUser:any, accountDits:any) => {
    const { accountName, loginURL } = accountDits;
    const users:any = serviceStore.readDocs('users');
    const accountToInsert:Account = {
      name: accountName,
      loginURL
    }
    const createdAccountId:any = serviceStore.createDoc('accounts', accountToInsert);
    users[currentUser.id].accountsIds.push(createdAccountId)
    serviceStore.updateDocs('users', users)
    return currentUser.id
}