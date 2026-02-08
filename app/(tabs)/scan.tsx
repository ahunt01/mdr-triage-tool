import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, FontSizes, Radius } from '../../constants/colors';
import ScanButton from '../../components/ScanButton';
import { extractFenFromImage } from '../../services/vision';

export default function ScanScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleTakePhoto = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to take photos of chess boards.'
        );
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const handleUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const handleScanPosition = async () => {
    if (!imageBase64) {
      Alert.alert('Error', 'No image data available. Please capture a new photo.');
      return;
    }

    setScanning(true);
    try {
      const result = await extractFenFromImage(imageBase64);
      router.push({
        pathname: '/(tabs)/analysis',
        params: {
          fen: result.fen,
          orientation: result.orientation,
          confidence: result.confidence.toString(),
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to scan position. Please try again.';
      Alert.alert('Scan Failed', message);
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setImageBase64(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Scan Chess Position</Text>
      <Text style={styles.subtitle}>
        Take a photo or upload an image of a chess board
      </Text>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <View style={styles.previewActions}>
            <ScanButton
              title="Scan Position"
              icon="search"
              onPress={handleScanPosition}
              loading={scanning}
              variant="primary"
              style={styles.actionButton}
            />
            <ScanButton
              title="Choose Different Image"
              icon="refresh"
              onPress={handleReset}
              variant="outline"
              disabled={scanning}
              style={styles.actionButton}
            />
          </View>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <ScanButton
            title="Take Photo"
            icon="camera"
            onPress={handleTakePhoto}
            variant="primary"
            style={styles.mainButton}
          />
          <ScanButton
            title="Upload Image"
            icon="image"
            onPress={handleUploadImage}
            variant="secondary"
            style={styles.mainButton}
          />
        </View>
      )}

      <View style={styles.tipCard}>
        <Ionicons name="bulb" size={20} color={Colors.warning} />
        <Text style={styles.tipText}>
          For best results, ensure the board is well-lit and fully visible in the frame.
        </Text>
      </View>
    </ScrollView>
  );
}

import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  mainButton: {
    paddingVertical: 28,
  },
  previewContainer: {
    marginBottom: 32,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  previewActions: {
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.body,
    flex: 1,
    lineHeight: 20,
  },
});
