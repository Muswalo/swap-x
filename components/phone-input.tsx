import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

export type Country = {
  name: string;
  iso2: string; // e.g. ZM
  dialCode: string; // e.g. +260
};

const COUNTRIES: Country[] = [
  // --- Africa ---
  { name: 'Algeria', iso2: 'DZ', dialCode: '+213' },
  { name: 'Angola', iso2: 'AO', dialCode: '+244' },
  { name: 'Benin', iso2: 'BJ', dialCode: '+229' },
  { name: 'Botswana', iso2: 'BW', dialCode: '+267' },
  { name: 'Burkina Faso', iso2: 'BF', dialCode: '+226' },
  { name: 'Burundi', iso2: 'BI', dialCode: '+257' },
  { name: 'Cabo Verde', iso2: 'CV', dialCode: '+238' },
  { name: 'Cameroon', iso2: 'CM', dialCode: '+237' },
  { name: 'Central African Republic', iso2: 'CF', dialCode: '+236' },
  { name: 'Chad', iso2: 'TD', dialCode: '+235' },
  { name: 'Comoros', iso2: 'KM', dialCode: '+269' },
  { name: 'Congo', iso2: 'CG', dialCode: '+242' },
  { name: 'Democratic Republic of the Congo', iso2: 'CD', dialCode: '+243' },
  { name: 'Djibouti', iso2: 'DJ', dialCode: '+253' },
  { name: 'Egypt', iso2: 'EG', dialCode: '+20' },
  { name: 'Equatorial Guinea', iso2: 'GQ', dialCode: '+240' },
  { name: 'Eritrea', iso2: 'ER', dialCode: '+291' },
  { name: 'Eswatini', iso2: 'SZ', dialCode: '+268' },
  { name: 'Ethiopia', iso2: 'ET', dialCode: '+251' },
  { name: 'Gabon', iso2: 'GA', dialCode: '+241' },
  { name: 'Gambia', iso2: 'GM', dialCode: '+220' },
  { name: 'Ghana', iso2: 'GH', dialCode: '+233' },
  { name: 'Guinea', iso2: 'GN', dialCode: '+224' },
  { name: 'Guinea-Bissau', iso2: 'GW', dialCode: '+245' },
  { name: 'Ivory Coast', iso2: 'CI', dialCode: '+225' },
  { name: 'Kenya', iso2: 'KE', dialCode: '+254' },
  { name: 'Lesotho', iso2: 'LS', dialCode: '+266' },
  { name: 'Liberia', iso2: 'LR', dialCode: '+231' },
  { name: 'Libya', iso2: 'LY', dialCode: '+218' },
  { name: 'Madagascar', iso2: 'MG', dialCode: '+261' },
  { name: 'Malawi', iso2: 'MW', dialCode: '+265' },
  { name: 'Mali', iso2: 'ML', dialCode: '+223' },
  { name: 'Mauritania', iso2: 'MR', dialCode: '+222' },
  { name: 'Mauritius', iso2: 'MU', dialCode: '+230' },
  { name: 'Morocco', iso2: 'MA', dialCode: '+212' },
  { name: 'Mozambique', iso2: 'MZ', dialCode: '+258' },
  { name: 'Namibia', iso2: 'NA', dialCode: '+264' },
  { name: 'Niger', iso2: 'NE', dialCode: '+227' },
  { name: 'Nigeria', iso2: 'NG', dialCode: '+234' },
  { name: 'Rwanda', iso2: 'RW', dialCode: '+250' },
  { name: 'Sao Tome and Principe', iso2: 'ST', dialCode: '+239' },
  { name: 'Senegal', iso2: 'SN', dialCode: '+221' },
  { name: 'Seychelles', iso2: 'SC', dialCode: '+248' },
  { name: 'Sierra Leone', iso2: 'SL', dialCode: '+232' },
  { name: 'Somalia', iso2: 'SO', dialCode: '+252' },
  { name: 'South Africa', iso2: 'ZA', dialCode: '+27' },
  { name: 'South Sudan', iso2: 'SS', dialCode: '+211' },
  { name: 'Sudan', iso2: 'SD', dialCode: '+249' },
  { name: 'Tanzania', iso2: 'TZ', dialCode: '+255' },
  { name: 'Togo', iso2: 'TG', dialCode: '+228' },
  { name: 'Tunisia', iso2: 'TN', dialCode: '+216' },
  { name: 'Uganda', iso2: 'UG', dialCode: '+256' },
  { name: 'Zambia', iso2: 'ZM', dialCode: '+260' },
  { name: 'Zimbabwe', iso2: 'ZW', dialCode: '+263' },

  // --- Major Non-African Countries ---
  { name: 'United States', iso2: 'US', dialCode: '+1' },
  { name: 'Canada', iso2: 'CA', dialCode: '+1' },
  { name: 'United Kingdom', iso2: 'GB', dialCode: '+44' },
  { name: 'Germany', iso2: 'DE', dialCode: '+49' },
  { name: 'France', iso2: 'FR', dialCode: '+33' },
  { name: 'India', iso2: 'IN', dialCode: '+91' },
  { name: 'China', iso2: 'CN', dialCode: '+86' },
  { name: 'Japan', iso2: 'JP', dialCode: '+81' },
  { name: 'Brazil', iso2: 'BR', dialCode: '+55' },
  { name: 'United Arab Emirates', iso2: 'AE', dialCode: '+971' },
  { name: 'Australia', iso2: 'AU', dialCode: '+61' },
];


function isoToFlag(iso2: string) {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export type PhoneInputProps = {
  value?: string;
  onChangeText?: (val: string) => void;
  defaultCountryIso?: string; // e.g. 'ZM'
  placeholder?: string;
  onDialCodeChange?: (dial: string, country: Country) => void;
  error?: string;
};

export function PhoneInput({ value, onChangeText, defaultCountryIso = 'ZM', placeholder = 'Phone', onDialCodeChange, error }: PhoneInputProps) {
  const text = useThemeColor({}, 'text');
  const border = `${text}33`;
  const fill = `${text}0F`;
  const bg = useThemeColor({}, 'background');
  const danger = '#ff453a';

  const defaultCountry = useMemo(() => COUNTRIES.find(c => c.iso2 === defaultCountryIso.toUpperCase()) || COUNTRIES[0], [defaultCountryIso]);
  const [visible, setVisible] = useState(false);
  const [country, setCountry] = useState<Country>(defaultCountry);

  React.useEffect(() => {
    onDialCodeChange?.(country.dialCode, country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <View style={[styles.wrap, { borderColor: error ? danger : border, backgroundColor: fill }]}> 
        <Pressable style={[styles.codeBtn, { borderColor: `${text}22` }]} onPress={() => setVisible(true)} hitSlop={10}>
          <ThemedText style={{ fontSize: 16 }}>{isoToFlag(country.iso2)} {country.dialCode}</ThemedText>
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor={`${text}66`}
          style={[styles.input, { color: text }]}
          returnKeyType="next"
        />
      </View>
      {error ? <View style={{ height: 6 }} /> : null}
      {error ? <View style={{ paddingHorizontal: 4 }}><ThemedText style={{ color: danger, fontSize: 12 }}>{error}</ThemedText></View> : null}

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <Pressable style={[styles.backdrop]} onPress={() => setVisible(false)} />
        <View style={[styles.sheet, { backgroundColor: bg }]}> 
          <View style={styles.sheetHeader}>
            <ThemedText type="title">Select country</ThemedText>
          </View>
          <FlatList
            data={COUNTRIES}
            keyExtractor={(item) => item.iso2}
            ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: `${text}11` }]} />}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  setCountry(item);
                  onDialCodeChange?.(item.dialCode, item);
                  setVisible(false);
                }}
              >
                <ThemedText style={styles.rowText}>{isoToFlag(item.iso2)}  {item.name}</ThemedText>
                <ThemedText style={[styles.rowText, { opacity: 0.7 }]}>{item.dialCode}</ThemedText>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeBtn: {
    paddingRight: 10,
    marginRight: 6,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#00000022',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  sheetHeader: {
    marginBottom: 8,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    fontSize: 16,
  },
});
