import {
  StyleSheet,
  Text,
  Image,
  StatusBar,
  View,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors, network } from "../../constants";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import * as ImagePicker from "expo-image-picker";
import ProgressDialog from "react-native-progress-dialog";
import { AntDesign } from "@expo/vector-icons";

const EditCategoryScreen = ({ navigation, route }) => {
  const { category, authUser } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [imageURL, setImageURL] = useState(category.image);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [alertType, setAlertType] = useState("error");

  //Method to post the data to server to edit the category using API call
  const editCategoryHandle = (id) => {
    var myHeaders = new Headers();
    myHeaders.append("x-auth-token", authUser.token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      title: title,
      image: imageURL,
      description: description,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    setIsLoading(true);
    //[check validations] -- Start
    if (title == "") {
      setError("Please enter the product title");
      setIsLoading(false);
    } else if (description == "") {
      setError("Please upload the product image");
      setIsLoading(false);
    } else {
      //[check validations] -- End
      fetch(`${network.serverIP}/update-category?id=${id}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          if (result.success == true) {
            setIsLoading(false);
            setAlertType("success");
            setError(result.message);
            setTitle(result.data.title);
            setDescription(result.data.description);
          }
        })
        .catch((error) => {
          setIsLoading(false);
          setError(error.message);
          setAlertType("error");
          console.log("error", error);
        });
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      upload(result.uri);
    }
  };

  const upload = async (imageUpload) => {
    var formdata = new FormData();
    formdata.append("filename", {
      uri: imageUpload,
      name: 'test.jpg',
      type: 'image/jpeg'
    });

    var ImageRequestOptions = {
      method: "POST",
      body: formdata,
    };

    fetch(
      `${network.serverIP}/photos/upload`,
      ImageRequestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setImageURL(result.downloadURL)
      })
      .catch((error) => console.log("error", error));
  };

  //inilize the title and description input fields on initial render
  useEffect(() => {
    setTitle(category?.title);
    setDescription(category?.description);
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container}>
      <StatusBar></StatusBar>
      <ProgressDialog visible={isLoading} label={"Adding ..."} />
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          onPress={() => {
            // navigation.replace("viewproduct", { authUser: authUser });
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText}>Edit Category</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph}>Add Edit details</Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: "100%" }}
      >
        <View style={styles.formContainer}>
          <View style={styles.imageContainer}>
            <TouchableOpacity style={styles.imageHolder} onPress={pickImage}>
              <Image
                source={{ uri: imageURL }}
                style={{ width: 200, height: 200 }}
              />
            </TouchableOpacity>
          </View>
          <CustomInput
            value={title}
            setValue={setTitle}
            placeholder={"Title"}
            placeholderTextColor={colors.muted}
            radius={5}
          />

          <CustomInput
            value={description}
            setValue={setDescription}
            placeholder={"Description"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
        </View>
      </ScrollView>

      <View style={styles.buttomContainer}>
        <CustomButton
          text={"Edit Category"}
          onPress={() => {
            editCategoryHandle(category?._id);
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditCategoryScreen;

const styles = StyleSheet.create({
  container: {
    
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  formContainer: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    
    padding: 5,
  },

  buttomContainer: {
    marginTop: 10,
    width: "100%",
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
  },
  imageContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    height: 250,
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
  imageHolder: {
    height: 200,
    width: 200,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
    borderRadius: 10,
    elevation: 5,
  },
});
