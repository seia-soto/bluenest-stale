import { ChakraProvider } from '@chakra-ui/react'
import { Talkr } from 'talkr'
import { Navbar } from '../components/Nav'
import ko from '../i18n/ko.json'

function CustomApp ({ Component, pageProps }) {
  return (
    <Talkr
      languages={{ ko }}
      defaultLanguage='ko'
    >
      <ChakraProvider>
        <Navbar />
        <Component {...pageProps} />
      </ChakraProvider>
    </Talkr>
  )
}

export default CustomApp
