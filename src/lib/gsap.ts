import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { RoughEase, ExpoScaleEase, SlowMo } from 'gsap/EasePack';
import { Draggable } from 'gsap/Draggable';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { Observer } from 'gsap/Observer';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';
import { TextPlugin } from 'gsap/TextPlugin';

/**
 * Central GSAP bootstrap. Import `gsap` (or `PIRATE_EASE`) from here anywhere
 * in the app and every registered plugin is available.
 *
 * Plugins actively driving animations on the site:
 *   ScrollTrigger, ScrollToPlugin, SplitText, ScrambleTextPlugin,
 *   DrawSVGPlugin, CustomEase.
 *
 * The rest are registered so they are one import away without needing the
 * boilerplate above (Draggable, Inertia, Flip, Observer, MotionPath,
 * MorphSVG, Text, and the EasePack helpers).
 *
 * Deliberately NOT included: GSDevTools and MotionPathHelper (dev tools that
 * ship an on-screen panel), PixiPlugin / EaselPlugin (need external PixiJS /
 * EaselJS libraries), and ScrollSmoother (a whole-page smooth-scroll wrapper
 * that can fight the existing ScrollTrigger measurements and anchor nav).
 */
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollToPlugin,
  Observer,
  SplitText,
  ScrambleTextPlugin,
  TextPlugin,
  Draggable,
  InertiaPlugin,
  Flip,
  MotionPathPlugin,
  MorphSVGPlugin,
  DrawSVGPlugin,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  CustomEase,
  CustomBounce,
  CustomWiggle,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
);

/** Signature easing curve used for entrance reveals. */
export const PIRATE_EASE = CustomEase.create('pirate', 'M0,0 C0.22,0.62 0.32,1 1,1');

export { gsap };
export default gsap;
