package fynxt.mapper.util;

import java.util.Arrays;
import java.util.List;

public class CommonMappingUtil {

	public String[] listToArray(List<String> list) {
		return list == null ? null : list.toArray(String[]::new);
	}

	public List<String> arrayToList(String[] array) {
		return array == null ? null : Arrays.asList(array);
	}

	public Float integerToFloat(Integer value) {
		return value != null ? value.floatValue() : null;
	}

	public Integer floatToInteger(Float value) {
		return value != null ? Math.round(value) : null;
	}

	public Integer longToInteger(Long value) {
		if (value == null) {
			return null;
		}
		if (value > Integer.MAX_VALUE || value < Integer.MIN_VALUE) {
			throw new ArithmeticException("Long value " + value + " overflows Integer range");
		}
		return value.intValue();
	}

	public Long integerToLong(Integer value) {
		return value != null ? value.longValue() : null;
	}

	public Float doubleToFloat(Double value) {
		return value != null ? value.floatValue() : null;
	}

	public Double floatToDouble(Float value) {
		return value != null ? value.doubleValue() : null;
	}

	public String unquoteString(String value) {
		if (value == null || value.length() < 2) {
			return value;
		}
		if (value.startsWith("\"") && value.endsWith("\"")) {
			return value.substring(1, value.length() - 1);
		}
		return value;
	}
}
