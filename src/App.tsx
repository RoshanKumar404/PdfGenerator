import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function App() {
  return (
    <View>
      <Text style={styles.heading}>Pdf Generator</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  heading:{
    //flex:1,
    fontSize: 34,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'black',
    paddingHorizontal:100,
    paddingVertical:350
  }
})