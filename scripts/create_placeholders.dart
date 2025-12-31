// Dart script to create placeholder images
// Run with: dart run scripts/create_placeholders.dart

import 'dart:io';

void main() async {
  final assetsDir = Directory('assets/images');
  if (!await assetsDir.exists()) {
    await assetsDir.create(recursive: true);
  }

  final imageNames = [
    'olive_leaf_spot.jpg',
    'olive_verticillium_wilt.jpg',
    'apple_mildew.jpg',
    'apple_fire_blight.jpg',
    'lemon_aphids.jpg',
    'lemon_citrus_greening.jpg',
    'orange_canker.jpg',
    'mango_anthracnose.jpg',
    'mango_powdery_mildew.jpg',
    'banana_panama.jpg',
    'banana_black_sogatoka.jpg',
    'grape_downy_mildew.jpg',
    'peach_leaf_curl.jpg',
    'pine_needle_blight.jpg',
    'avocado_root_rot.jpg',
    'fig_rust.jpg',
    'cherry_brown_rot.jpg',
    'pear_fire_blight.jpg',
    'papaya_mildew.jpg',
    'coconut_bud_rot.jpg',
    'walnut_thousand_cankers.jpg',
    'maple_verticillium_wilt.jpg',
    'cedar_apple_rust.jpg',
    'chestnut_blight.jpg',
    'eucalyptus_leaf_blight.jpg',
  ];

  print('Creating placeholder files...');
  for (final imageName in imageNames) {
    final file = File('${assetsDir.path}/$imageName');
    if (!await file.exists()) {
      // Create an empty file as placeholder
      // The app will use the error builder to show a beautiful placeholder
      await file.create();
      print('✓ Created: $imageName');
    } else {
      print('⊘ Already exists: $imageName');
    }
  }
  print('\nDone! The app will display beautiful colored placeholders for these images.');
  print('You can replace these files with actual images later.');
}

