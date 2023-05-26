import { Button, Linking, Text, View } from "react-native";
import VisionScreen from "./VisionScreen";
import styles from "./styles";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [permission, request] = ImagePicker.useCameraPermissions({
    get: true,
  });

  const requestPermission = async () => {
    if (permission.status === "denied") {
      Linking.openSettings();
    } else {
      request();
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>
          You have not granted permission to use the camera on this device!
        </Text>
        <Button onPress={requestPermission} title="Request Permission" />
      </View>
    );
  }

  return <VisionScreen />;
}
