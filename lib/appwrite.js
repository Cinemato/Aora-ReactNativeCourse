import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https:/cloud.appwrite.io/v1',
    platform: 'com.cinemato.aora',
    projectId: '674a449100020e711b3c',
    databaseId: '674a4673002711aee9ae',
    userCollectionId: '674a46960009e5e1bdd5',
    videoCollectionId: '674a4763000cb756b1de',
    storageId: '674a48f10037fc458567'
}

const client = new Client()
    .setProject(config.projectId)
    .setPlatform(config.platform)
    .setEndpoint(config.endpoint);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(), 
            email, 
            password, 
            username)
        
        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)
        
        await signIn(email, password)

        const newUser = await databases.createDocument(
            config.databaseId, 
            config.userCollectionId, 
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        )

        return newUser

    } catch (error) {
        console.log(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)
        return session
    } catch (error) {
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(config.databaseId, config.userCollectionId, [Query.equal('accountId', currentAccount.$id)])
    
        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error)
    }
}