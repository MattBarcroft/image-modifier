import DropDownPicker from "react-native-dropdown-picker";
import { useEffect, useState } from "react";
import { Button, Image, Text, View, ActivityIndicator } from "react-native";
import styles from "./styles";
import * as ImagePicker from "expo-image-picker";

const DEEP_AI_API_KEY = "123321";
const DEEP_AI_API_URL = "https://api.deepai.org/api/";

const GOOGLE_VISION_API_KEY = "ABCCBA";
const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

async function callGoogleVisionAsync(image) {
  const body = {
    requests: [
      {
        image: {
          content: image,
        },
        features: [
          {
            type: "LABEL_DETECTION",
            maxResults: 1,
          },
        ],
      },
    ],
  };

  const response = await fetch(GOOGLE_VISION_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const parsed = await response.json();

  console.log("Result:", parsed);

  return parsed.responses[0].labelAnnotations[0].description;
}

const VisionScreen = () => {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [deepAiImageUrl, setDeepAiImageUrl] = useState(null);

  const [adjectivesOpen, setAdjectivesOpen] = useState(false);
  const [adjectiveValue, setAdjectiveValue] = useState(null);
  const [adjectives, setAdjectives] = useState([
    { label: "Blue", value: "Blue" },
    { label: "Big", value: "Big" },
    { label: "Tiny", value: "Tiny" },
    { label: "Round", value: "Round" },
    { label: "Square", value: "Square" },
    { label: "Thick", value: "Thick" },
    { label: "Angry", value: "Angry" },
    { label: "Happy", value: "Happy" },
  ]);

  const [artStyleOpen, setArtStyleOpen] = useState(false);
  const [artStyleValue, setArtStyleValue] = useState(null);
  const [artStyle, setArtStyle] = useState([
    { label: "Text to Image", value: "text2img" },
    {
      label: "Renaissance Painting",
      value: "renaissance-painting-generator",
    },
    { label: "Cyberpunk", value: "cyberpunk-generator" },
    { label: "Old Style Generator", value: "old-style-generator" },
    {
      label: "Impressionism Painting",
      value: "impressionism-painting-generator",
    },
    {
      label: "Fantasy Character",
      value: "fantasy-character-generator",
    },
  ]);

  useEffect(() => {
    const fetchImage = async () => {
      if (status) {
        const formData = new FormData();
        formData.append("text", `${adjectiveValue} ${status}`);

        const resp = await fetch(`${DEEP_AI_API_URL}${artStyleValue}`, {
          method: "POST",
          headers: {
            "api-key": DEEP_AI_API_KEY,
          },
          body: formData,
        });
        const parsed = await resp.json();

        console.log("Result:", parsed);

        return setDeepAiImageUrl(parsed.output_url);
      }
    };
    fetchImage();
  }, [status]);

  const takePictureAsync = async () => {
    const { cancelled, uri, base64 } = await ImagePicker.launchCameraAsync({
      base64: true,
    });
    if (!cancelled) {
      setImage(uri);
      setStatus("Loading...");
      try {
        const result = await callGoogleVisionAsync(base64);
        setStatus(result);
      } catch (error) {
        console.log(error);
        setStatus(`Error: ${error.message}`);
      }
    } else {
      setImage(null);
      setStatus(null);
    }
  };

  return (
    <View style={styles.container}>
      {!status ? (
        <View style={{ zIndex: 1000 }}>
          <Text style={{ textAlign: "center" }}>Modifier</Text>

          <DropDownPicker
            containerStyle={{ zIndex: 2000 }}
            open={adjectivesOpen}
            value={adjectiveValue}
            items={adjectives}
            setOpen={setAdjectivesOpen}
            setValue={setAdjectiveValue}
            setItems={setAdjectives}
          />
          <Text style={{ textAlign: "center" }}>Art Style</Text>

          <DropDownPicker
            containerStyle={{ zIndex: 1000 }}
            open={artStyleOpen}
            value={artStyleValue}
            items={artStyle}
            setOpen={setArtStyleOpen}
            setValue={setArtStyleValue}
            setItems={setArtStyle}
          />
        </View>
      ) : null}

      <Button
        style={{ zIndex: 0 }}
        onPress={takePictureAsync}
        title="Take a Picture"
      />

      {image && (
        <View>
          <Image style={styles.image} source={{ uri: image }} />
        </View>
      )}

      {status && (
        <View>
          <Text>{`Your picture: ${status}`}</Text>
        </View>
      )}

      {status && !deepAiImageUrl ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : null}
      {deepAiImageUrl && (
        <View>
          <Text>{`Your Creation: ${adjectiveValue} ${status} in the style of ${artStyleValue}`}</Text>
          <Image style={styles.image} source={{ uri: deepAiImageUrl }} />
        </View>
      )}
    </View>
  );
};

module.exports = VisionScreen;
