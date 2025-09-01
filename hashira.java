import java.util.*;

public class Main {
    public static long toDecimal(String value, int base) {
        long result = 0;
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            int digit;
            if (Character.isDigit(ch)) {
                digit = ch - '0';
            } else {
                digit = 10 + (Character.toLowerCase(ch) - 'a');
            }
            result = result * base + digit;
        }
        return result;
    }

    public static void main(String[] args) {
        // Example test case
        int n = 4, k = 3;
        List<Pair<Long, Long>> points = new ArrayList<>();

        // Manually load values (simulate)
        points.add(new Pair<>(1L, toDecimal("4", 10)));
        points.add(new Pair<>(2L, toDecimal("111", 2))); // 111 in binary = 7
        points.add(new Pair<>(3L, toDecimal("12", 10)));

        // System of equations: y = ax^2 + bx + c
        int degree = k - 1; // here = 2
        int sz = k;
        double[][] A = new double[sz][sz];
        double[] B = new double[sz];

        for (int i = 0; i < sz; i++) {
            double x = points.get(i).getKey();
            double y = points.get(i).getValue();
            A[i][0] = x * x;
            A[i][1] = x;
            A[i][2] = 1;
            B[i] = y;
        }

        // Solve linear system using Gaussian elimination
        for (int i = 0; i < sz; i++) {
            // Normalize pivot
            double div = A[i][i];
            for (int j = 0; j < sz; j++) {
                A[i][j] /= div;
            }
            B[i] /= div;
            
            // Eliminate others
            for (int k2 = 0; k2 < sz; k2++) {
                if (i == k2) continue;
                double factor = A[k2][i];
                for (int j = 0; j < sz; j++) {
                    A[k2][j] -= factor * A[i][j];
                }
                B[k2] -= factor * B[i];
            }
        }

        // Now B has coefficients
        double a = B[0], b = B[1], c = B[2];
        System.out.println("Constant C = " + c);
    }
    
    // Simple Pair class since Java doesn't have one built-in
    static class Pair<K, V> {
        private K key;
        private V value;
        
        public Pair(K key, V value) {
            this.key = key;
            this.value = value;
        }
        
        public K getKey() { return key; }
        public V getValue() { return value; }
    }
}