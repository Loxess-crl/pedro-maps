import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface ChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const Chip: React.FC<ChipProps> = ({ label, isActive, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full border transition-all ${
        isActive
          ? "bg-blue-500 text-white border-blue-500 dark:bg-blue-700 dark:border-blue-700"
          : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
      }`}
    >
      <Text
        className={`${isActive ? "text-white" : "text-gray-700 dark:text-gray-300"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

interface ChipGroupProps {
  options: { label: string; value: string }[];
  onChange?: (value: string) => void;
  defaultValue?: string;
}

const ChipGroup: React.FC<ChipGroupProps> = ({
  options,
  onChange,
  defaultValue,
}) => {
  const [selected, setSelected] = useState<string | null>(defaultValue || null);

  const handlePress = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };

  return (
    <View className="flex-row gap-2">
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          isActive={selected === option.value}
          onPress={() => handlePress(option.value)}
        />
      ))}
    </View>
  );
};

export default ChipGroup;
