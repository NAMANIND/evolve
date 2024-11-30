import { Ionicons } from "@expo/vector-icons";

export const icons = {
  index: (props) => (
    <Ionicons name="stats-chart" size={24} color={props.color} />
  ),
  logger: (props) => <Ionicons name="barbell" size={24} color={props.color} />,
  profile: (props) => <Ionicons name="person" size={24} color={props.color} />,
};
