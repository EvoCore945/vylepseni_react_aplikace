<?php

// Pomocná třída pro formátování, export do CSV a generování API odpovědí
class ResponseHelper
{
    protected function output($str)
    {
        if (isset($_GET["csvexport"])) {
            $this->CSVoutput($str);
            exit;
        }

        if (!is_array($str)) {
            if ($str == "0") $str = "err";
            echo json_encode(array("msg" => $str));
        } else {
            echo json_encode($str);
        }
    }

    private function CSVoutput($str)
    {
        if ($str == null) return;
        
        $fp = fopen(getcwd() . '/csvexport.csv', 'w');
        
        if (is_array($str)) {
            $firstRow = reset($str);
            $headers = array_merge([''], array_keys($firstRow));
            fputcsv($fp, $this->convert_encoding($headers), ';', '"', '\\');

            foreach ($str as $key => $row) {
                if (isset($row["name"])) {
                    $row["name"] = preg_replace('/\/\(kont\).*/', '', $row["name"]);
                }
                fputcsv($fp, $this->convert_encoding(array_merge([$key], $row)), ';', '"', '\\');
            }
        } else {
            fputs($fp, $str);
        }

        fclose($fp);
        header("Content-Type: text/plain; charset=Windows-1250");
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="/v3/csvexport.csv"');
        readfile(getcwd() . '/csvexport.csv');
        exit;
    }

    private function convert_encoding($array)
    {
        return array_map(function ($value) {
            if ($value == null) return "";
            return iconv("UTF-8", "Windows-1250//IGNORE", $value);
        }, $array);
    }
}

// Globální pomocná funkce zachovaná pro zpětnou kompatibilitu
function fix_encoding($data)
{
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = fix_encoding($value);
        }
    } elseif (is_string($data)) {
        return iconv('ISO-8859-2', 'UTF-8//IGNORE', $data);
    }
    return $data;
}
?>