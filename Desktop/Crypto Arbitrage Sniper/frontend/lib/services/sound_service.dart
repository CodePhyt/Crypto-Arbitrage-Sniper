import 'dart:io';
import 'package:audioplayers/audioplayers.dart';

class SoundService {
  final AudioPlayer _player = AudioPlayer();
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;

    try {
      await _player.setReleaseMode(ReleaseMode.stop);
      _initialized = true;
    } catch (e) {
      print('Error initializing sound service: $e');
    }
  }

  Future<void> playAlert() async {
    if (!_initialized) return;

    try {
      if (Platform.isWindows || Platform.isMacOS || Platform.isLinux) {
        await _player.play(AssetSource('sounds/alert.wav'));
      }
    } catch (e) {
      print('Error playing alert sound: $e');
    }
  }

  void dispose() {
    _player.dispose();
  }
}
