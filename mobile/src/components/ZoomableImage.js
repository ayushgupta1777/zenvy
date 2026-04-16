import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZoomableImage = ({ uri, style, resizeMode = 'contain', onZoomChange }) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    const savedTranslationX = useSharedValue(0);
    const savedTranslationY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
            if (onZoomChange) {
                runOnJS(onZoomChange)(scale.value > 1.05);
            }
        })
        .onEnd(() => {
            if (scale.value < 1.05) {
                scale.value = withTiming(1);
                translationX.value = withTiming(0);
                translationY.value = withTiming(0);
                savedScale.value = 1;
                savedTranslationX.value = 0;
                savedTranslationY.value = 0;
                if (onZoomChange) runOnJS(onZoomChange)(false);
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (scale.value > 1.05) {
                translationX.value = savedTranslationX.value + event.translationX;
                translationY.value = savedTranslationY.value + event.translationY;
            }
        })
        .onEnd(() => {
            if (scale.value > 1.05) {
                savedTranslationX.value = translationX.value;
                savedTranslationY.value = translationY.value;
            }
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1.05) {
                scale.value = withTiming(1);
                translationX.value = withTiming(0);
                translationY.value = withTiming(0);
                savedScale.value = 1;
                savedTranslationX.value = 0;
                savedTranslationY.value = 0;
                if (onZoomChange) runOnJS(onZoomChange)(false);
            } else {
                scale.value = withTiming(2);
                savedScale.value = 2;
                if (onZoomChange) runOnJS(onZoomChange)(true);
            }
        });

    const composed = Gesture.Simultaneous(pinchGesture, Gesture.Race(panGesture, doubleTapGesture));

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translationX.value },
                { translateY: translationY.value },
                { scale: scale.value },
            ],
        };
    });

    return (
        <GestureDetector gesture={composed}>
            <Animated.Image
                source={{ uri }}
                style={[style, animatedStyle]}
                resizeMode={resizeMode}
            />
        </GestureDetector>
    );
};

export default ZoomableImage;
