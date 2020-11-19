import * as React from 'react'
import { ChakraProvider, theme } from '@chakra-ui/react'

export const Providers: React.FC = ({ children }) => (
  <ChakraProvider theme={theme}>{children}</ChakraProvider>
)
