import { StyleSheet } from "react-native";

export const globalStyle = StyleSheet.create({
    container: {
        marginTop: 20,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 15
    },
    label: {
        fontWeight: "bold",
        fontSize: 16
    },
    input: {
        padding: 10,
        fontSize: 16,
        borderColor: "black",
        borderWidth: 1,
        width: "80%"
    },
    link: {
        width: "80%",
        marginHorizontal: "auto",
        padding: 10,
        marginVertical: 10,
        borderColor: "black",
        borderWidth: 1
    },
    image: {
        width: 280,
        marginHorizontal: "auto",
        marginVertical: 10,
        borderColor: "black",
        borderWidth: 1,
        height: 280
    }
})