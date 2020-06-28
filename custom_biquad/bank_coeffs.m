%{
    This script allow to generate a filter bank second-order section / biquad coefficients and output it as an array
    Resulting array is to be found in a 'coeffs.js' file
    The array contain the filter bank order as first entry with gain value + biquad coefficients for each orders and for each filters.

    by default it use a butterworth type filter but many others are available in Matlab / GNU Octave (elliptic, chebyshev etc.) and can be generated easily by calling the right function

    run('bank_coeffs.m')
%}

pkg load signal

function f = getFrequency(n,b,i,o);
    f = b * power(2, i / (n / o));
endfunction

file_id = fopen('coeffs.js', 'w');

filter_order = 2 % note : filters are of order 2n
bank_height = 439
base_frequency = 16.34
octaves = 10
sample_rate = 44100

fprintf(file_id, "[");
fprintf(file_id, "%i, // order\n", filter_order);
for i = 0:bank_height
    [b,p,a] = ellip(filter_order, 0.05, 40, [getFrequency(bank_height, base_frequency, bank_height - i, octaves),getFrequency(bank_height, base_frequency, bank_height - i + 1, octaves)] / (sample_rate / 2));
    [sos,g] = zp2sos(b,p,a) %tf2sos(b,a)

    % plot frequency response, see: http://vadkudr.org/Algorithms/fvtooldemo/bqfilt.html
    %fvtool(b, a,'Fs',44100)

    result = transpose(sos)

    fprintf(file_id, "%.17f,// gain\n", g);
    fprintf(file_id, "%.17f,", transpose(sos));
    fprintf(file_id, "\n");
endfor
fprintf(file_id, "]");
fclose(file_id);
