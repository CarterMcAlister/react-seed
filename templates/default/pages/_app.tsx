import { Providers } from 'components/Providers'

export const App = ({ Component, pageProps }) => (
  <Providers>
    <Component {...pageProps} />
  </Providers>
)

export default App
