import { Box, Code, Grid, Link, Text, VStack } from '@chakra-ui/react'
import { ColorModeSwitcher } from 'components/ColorModeSwitcher'
import Head from 'next/head'
import * as React from 'react'

export const App = () => (
  <Box textAlign='center' fontSize='xl'>
    <Head>
      <title>React Seed</title>
      <link rel='icon' href='/favicon.ico' />
    </Head>
    <Grid minH='100vh' p={3}>
      <ColorModeSwitcher justifySelf='flex-end' />
      <VStack spacing={8}>
        <Text>
          Edit <Code fontSize='xl'>src/App.tsx</Code> and save to reload.
        </Text>
        <Link
          color='teal.500'
          href='https://chakra-ui.com'
          fontSize='2xl'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn Chakra
        </Link>
      </VStack>
    </Grid>
  </Box>
)
