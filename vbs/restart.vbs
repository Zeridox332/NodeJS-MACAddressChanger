inputUser = MsgBox("Direccion MAC y HostName cambiados. Se ha desactivado la interfaz de red para actualizar el cambio de direccion MAC, reinicia el equipo para aplicar los cambios de HostName y ser reconocido como dispositivo nuevo en la red", 1, "INFORMACION IMPORTANTE")

If inputUser = 1 Then
    Call MsgBox("Se reiniciara el equipo, vuelve a reactivar la interfaz en el programa seleccionando la opcion 'Reactivar interfaz de red'", 64, "Reiniciando")
    Set WSHShell = WScript.CreateObject("WScript.Shell")
    WshShell.Run "C:\WINDOWS\system32\shutdown.exe -r -t 3"
Else
    Call MsgBox("Tu direccion MAC ha sido cambiada pero tu nombre en la red no. Puedes re-activar la interfaz en el programa seleccionando la opcion 'Reactivar interfaz de red'. Si quieres ser reconocido como dispositivo nuevo en la red reinicia el equipo para aplicar los cambios de HostName y luego re-activa la interfaz en el programa (Si te has conectado a la red con la nueva direccion MAC tu nombre en la red no cambiara)", 64, "INFORMACION IMPORTANTE")
End If
    