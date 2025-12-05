import { Box, Tab, Tabs } from '@mui/material'
import './App.css'
import Faucet from './components/Faucet'
import WhiteToken from './components/WhiteToken'
import { useState } from 'react';

function App() {
  const [value, setValue] = useState('Faucet');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <Tabs
          value={value}
          onChange={handleChange}
        >
          <Tab
            value="Faucet"
            label="Faucet"
          />
          <Tab value="WhiteToken" label="White Token" />
        </Tabs>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} bgcolor={"#f0f0f0"}>
        {value === "Faucet" && <Faucet />}
        {value === "WhiteToken" && <WhiteToken />}
      </Box>
    </Box>
  )
}

export default App;
