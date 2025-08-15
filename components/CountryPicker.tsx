import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import type { FlatListProps, ListRenderItemInfo } from 'react-native';
import { countryCodes } from 'react-native-country-codes-picker';

type Country = {
  name: string;
  dial_code: string; 
  code: string;      
  flag?: string;     
};

interface CountryPickerProps {
  countryCode: string;
  onSelect: (code: string) => void;
  disabled?: boolean;
}


const ITEM_HEIGHT = 48;
const MENU_WIDTH = 260;
const V_GAP = 8;  
const H_GAP = 8;  

export default function CountryPicker({ countryCode, onSelect, disabled }: CountryPickerProps) {
  const [visible, setVisible] = useState(false);

  // Ref to the trigger button so we can measure its screen position
  const anchorRef = useRef<any>(null);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // ① ISO whitelist (replace the old dial-code whitelist)
  const allowedISO: readonly string[] = ['US', 'CA', 'CN', 'GB', 'JP'];

  // ② Build data by filtering with ISO codes (not by dial code)
  const data: Country[] = useMemo(
    () =>
      countryCodes
        .filter((c: any) => allowedISO.includes(c.code))
        .map((c: any) => ({
          name: c.name,
          dial_code: c.dial_code,
          code: c.code,
          flag: c.flag,
        })),
    []
  );

  // ③ Preferred ISO for shared dial codes (choose which flag to show)
  const preferredISOForDial: Record<string, string> = {
    '+1': 'CA', // change to 'US' if you want the US flag by default
    '+44': 'GB',
    '+86': 'CN',
    '+81': 'JP',
  };

  // Find current selection index and flag for the trigger
  let selectedIndex = data.findIndex(
    (c) => c.dial_code === countryCode && c.code === preferredISOForDial[countryCode]
  );
  if (selectedIndex < 0) selectedIndex = data.findIndex((c) => c.dial_code === countryCode);
  selectedIndex = Math.max(0, selectedIndex);

  const selectedFlag = data[selectedIndex]?.flag ?? '🏳️';

  // When opening, measure the trigger to decide where to place the menu
  const open = () => {
    if (disabled) return;
    anchorRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
      setAnchorRect({ x, y, w, h });
      setVisible(true);
    });
  };
  const close = () => setVisible(false);

  // Compute the dropdown position: prefer opening below; if not enough space, open above
  const menuPosition = (() => {
    const { width: W, height: H } = Dimensions.get('window');
    const maxMenuH = Math.min(ITEM_HEIGHT * 8, Math.floor(H * 0.6)); // up to 8 rows or 60% screen
    const left = Math.min(Math.max(anchorRect.x, H_GAP), W - MENU_WIDTH - H_GAP);
    const openDownTop = anchorRect.y + anchorRect.h + V_GAP;
    const openUpTop = Math.max(V_GAP, anchorRect.y - maxMenuH - V_GAP);
    const top = openDownTop + maxMenuH > H - V_GAP ? openUpTop : openDownTop;
    return { top, left, maxMenuH };
  })();

  const getItemLayout: FlatListProps<Country>['getItemLayout'] = (_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  // Scroll to the previously-selected item when the menu becomes visible
  const listRef = useRef<FlatList<Country>>(null);
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => {
      if (selectedIndex >= 0) {
        listRef.current?.scrollToIndex({ index: selectedIndex, animated: false });
      }
    }, 0);
    return () => clearTimeout(id);
  }, [visible, selectedIndex]);

  const renderItem = ({ item }: ListRenderItemInfo<Country>) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        onSelect(item.dial_code);
        close();
      }}
    >
      <Text style={styles.rowText}>{`${item.flag} ${item.dial_code} (${item.code})`}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Trigger button: flag + caret, matches your homepage style */}
      <TouchableOpacity
        ref={anchorRef}
        style={[styles.picker, disabled && styles.pickerDisabled]}
        onPress={open}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{selectedFlag}</Text>
        <Text style={styles.caret}>▼</Text>
      </TouchableOpacity>

      {/* Lightweight dropdown: transparent Modal + positioned container */}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        {/* Backdrop: tapping anywhere outside closes the menu */}
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />

        {/* Positioned menu (popover) */}
        <View
          style={[
            styles.menu,
            {
              top: menuPosition.top,
              left: menuPosition.left,
              maxHeight: menuPosition.maxMenuH,
              width: MENU_WIDTH,
            },
          ]}
        >
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(item) => `${item.dial_code}-${item.code}`}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Trigger button - updated to match the new design
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    minWidth: 80,
  },
  pickerDisabled: { opacity: 0.6 },
  flag: { fontSize: 18, marginRight: 8 },
  caret: { fontSize: 10, color: '#666' },

  // Floating dropdown container (popover)
  menu: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: 'hidden',
  },

  row: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  rowText: { fontSize: 16, color: '#111' },
});
