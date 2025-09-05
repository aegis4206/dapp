import { Box } from '@mui/material'
import './App.css'
import Faucet from './components/Faucet'
import WhiteToken from './components/WhiteToken'

function App() {

  return (
    <>
      <Box flex={1} display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor={"#f0f0f0"}>
        <WhiteToken />
      </Box>
    </>
  )
}

export default App;
