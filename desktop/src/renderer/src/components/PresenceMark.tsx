import React from 'react'
import BrandMark from './BrandMark'

// The Attentify mark in the sidebar.
//
// This used to render a state-coloured aura that breathed behind the logo (the "AI's body").
// That glow was removed at the user's request: the mark now reads as a clean logo, with no
// halo behind it. The app's ambient state still shows through AmbientWash on the main plane,
// so nothing else about the presence design changes.
export default function PresenceMark({ size = 26 }: { size?: number }): React.ReactElement {
  return <BrandMark size={size} />
}
