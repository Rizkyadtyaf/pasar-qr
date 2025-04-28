import ImageKit from "imagekit-javascript";

export const imagekit = new ImageKit({
    urlEndpoint: process.env.EXPO_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
    publicKey: process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    // transformationPosition: "path",
})