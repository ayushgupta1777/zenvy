import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import DevHubScreen         from '../screens/dev/DevHubScreen';
import DevTerminalScreen    from '../screens/dev/DevTerminalScreen';   // Live Monitor (Module 1)
import DevUserListScreen    from '../screens/dev/DevUserListScreen';
import DevUserDetailScreen  from '../screens/dev/DevUserDetailScreen';
import DevServerHealthScreen from '../screens/dev/DevServerHealthScreen';
import DevFinancialsScreen  from '../screens/dev/DevFinancialsScreen';
import DevGeoPresenceScreen from '../screens/dev/DevGeoPresenceScreen';
import DevErrorLogScreen    from '../screens/dev/DevErrorLogScreen';
import DevDeviceIntelScreen from '../screens/dev/DevDeviceIntelScreen';
import DevSecurityScreen    from '../screens/dev/DevSecurityScreen';
import DevControlPanelScreen from '../screens/dev/DevControlPanelScreen';
import DevOrderPulseScreen  from '../screens/dev/DevOrderPulseScreen';

import DevResellerListScreen from '../screens/dev/DevResellerListScreen';
import DevResellerDetailScreen from '../screens/dev/DevResellerDetailScreen';
import DevFakeChatScreen     from '../screens/dev/DevFakeChatScreen';

const Stack = createStackNavigator();

const screenOpts = (title) => ({ title });

const DeveloperNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F0FDF4', borderBottomWidth: 1, borderBottomColor: '#10B981' },
        headerTintColor: '#064E3B',
        headerTitleStyle: { fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', fontSize: 13 },
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      {/* Hub — Entry Point */}
      <Stack.Screen name="DevHub"          component={DevHubScreen}          options={screenOpts('DEVELOPER TERMINAL')} />

      {/* Reseller Intel (Module 10) */}
      <Stack.Screen name="DevResellerList" component={DevResellerListScreen} options={screenOpts('RESELLER INTELLIGENCE')} />
      <Stack.Screen name="DevResellerDetail" component={DevResellerDetailScreen} options={screenOpts('RESELLER DEEP-DIVE')} />

      {/* Chat Simulation (Module 11) */}
      <Stack.Screen name="DevFakeChat"     component={DevFakeChatScreen}     options={screenOpts('SIMULATION TERMINAL')} />

      {/* Module 1 — Live Monitor */}
      <Stack.Screen name="DevLiveMonitor"  component={DevTerminalScreen}     options={screenOpts('LIVE NODES')} />

      {/* Module 2 — Server Health */}
      <Stack.Screen name="DevServerHealth" component={DevServerHealthScreen} options={screenOpts('SERVER HEALTH')} />

      {/* Module 3 — Financials */}
      <Stack.Screen name="DevFinancials"   component={DevFinancialsScreen}   options={screenOpts('FINANCIAL INTEL')} />

      {/* Module 4 — Geo Presence */}
      <Stack.Screen name="DevGeoPresence"  component={DevGeoPresenceScreen}  options={screenOpts('GEO PRESENCE')} />

      {/* Module 5 — Error Logs */}
      <Stack.Screen name="DevErrorLog"     component={DevErrorLogScreen}     options={screenOpts('ERROR LOGS')} />

      {/* Module 6 — Device Intel */}
      <Stack.Screen name="DevDeviceIntel"  component={DevDeviceIntelScreen}  options={screenOpts('DEVICE INTEL')} />

      {/* Module 7 — Security */}
      <Stack.Screen name="DevSecurity"     component={DevSecurityScreen}     options={screenOpts('SECURITY ALERTS')} />

      {/* Module 8 — Control Panel */}
      <Stack.Screen name="DevControlPanel" component={DevControlPanelScreen} options={screenOpts('CONTROL PANEL')} />

      {/* Module 9 — Order Pulse */}
      <Stack.Screen name="DevOrderPulse"   component={DevOrderPulseScreen}   options={screenOpts('ORDER PULSE')} />

      {/* User Database */}
      <Stack.Screen name="DevUserList"     component={DevUserListScreen}     options={screenOpts('USER DATABASE')} />
      <Stack.Screen name="DevUserDetail"   component={DevUserDetailScreen}   options={screenOpts('USER DEEP-DIVE')} />
    </Stack.Navigator>
  );
};

export default DeveloperNavigator;
