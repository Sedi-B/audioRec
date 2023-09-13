import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export default function App() {
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [sound, setSound] = useState();

  useEffect(() => {
    Audio.requestPermissionsAsync();
    [];
  });

  async function playRecording() {
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);
    await sound.playAsync();
  }

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status == "granted")
        console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      setSound(sound);
      let updateRecordings = [...recordings];
      updateRecordings.push({
        sound: sound,
        duration: getDurationFormatted(status.durationMillis),
        file: recording.getURI(),
      });
      setRecordings(updateRecordings);
      setRecording(null); // Reset the recording state
      console.log("Recording Stopped");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  function getDurationFormatted(millis) {
    const seconds = Math.floor((millis / 1000) % 60);
    const minutes = Math.floor((millis / (1000 * 60)) % 60);
    const hours = Math.floor((millis / (1000 * 60 * 60)) % 24);
    const days = Math.floor(millis / (1000 * 60 * 60 * 24));

    return `${hours}:${minutes}:${seconds}:${days}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.recordText}>Sedicords</Text>
      <StatusBar style="auto" />

      <View style={styles.topView}>
        <Text style={{ padding: 20, fontSize: 20 }}>Your recordings</Text>
        <View style={styles.recordingsList}>
          <Text>
            {" "}
            {recordings.map((item, index) => {
              return (
                <View key={index} style={styles.recordingItem}>
                  <Text style={styles.recordingName}>
                    {" "}
                    {index + 1} -{item.duration}
                  </Text>
                  <Pressable onPress={() => item.sound.replayAsync()}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}></Text>
                  </Pressable>
                  <Pressable onPress={playRecording}>
                    <Text>▶️</Text>
                  </Pressable>
                </View>
              );
            })}
          </Text>
        </View>
      </View>
      <View style={styles.bottomView}>
        <Pressable
          style={styles.btnStyle}
          onPress={recording ? stopRecording : startRecording}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {recording ? "Stop" : "Rec"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    flex: 1,
    backgroundColor: "#FFFEC4",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  recordText: {
    fontSize: 20,
    color: "red",
  },
  topView: {
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: "#FF9B9B",
    alignItems: "center",

    height: "40%",
    width: "100%",
  },
  bottomView: {
    borderRadius: 50,
    marginBottom: 5,
    backgroundColor: "#FFD6A5",
    alignItems: "center",
    justifyContent: "center",
    height: "50%",
    width: "100%",
  },
  btnStyle: {
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    padding: 20,
    backgroundColor: "#FF2400",
    borderRadius: 80,
    alignItems: "center",
  },
  recordingsList: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingHorizontal: 20,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  recordingName: {
    fontSize: 16,
    flex: 1,
  },
  playButton: {
    marginLeft: 10,
  },
});
