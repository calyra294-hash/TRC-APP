import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './RegistrarUsuario.styles.js';
import { registrarUsuario } from '../../services/usuarios.service';
import { seleccionarYComprimirImagen } from '../../utils/imagePickerHelper';
import { subirImagenASupabase } from '../../services/uploadService'; 

const e = React.createElement;

const initialState = {
  email: '',
  contrasena: '',
  nombre1: '',
  nombre2: '',
  apellido1: '',
  apellido2: '',
  cedula: '',
  telefono: '',
  direccion: '',
  licencia: '',
  tipo_licencia: '',
  fecha_nacimiento: '',
  rol: 'usuario',
  estado_aprobacion: 'pendiente',
  url_cedula: null,
  url_licencia: null,
  url_avatar: null,
};

export default function RegistrarUsuarioScreen({ visible = true, onBack, onSuccess }) {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(null); // 'avatar' | 'cedula' | 'licencia'

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async (field) => {
    try {
      setLoadingImage(field);
      const compressedBase64 = await seleccionarYComprimirImagen('library');
      if (compressedBase64) {
        handleChange(field, compressedBase64);
      }
    } catch (error) {
      Alert.alert('Error de Imagen', error.message);
    } finally {
      setLoadingImage(null);
    }
  };

  const handleRegister = async () => {
    if (
      !formData.email.trim() ||
      !formData.contrasena.trim() ||
      !formData.nombre1.trim() ||
      !formData.apellido1.trim() ||
      !formData.cedula.trim()
    ) {
      Alert.alert('Campos Requeridos', 'Por favor completa el correo, contraseña, primer nombre, primer apellido y cédula.');
      return;
    }

    setLoading(true);
    try {
      let urlImagenCedula = formData.foto_cedula; // O como se llame tu propiedad en el state

      // 1. Si el usuario seleccionó una imagen local (empieza con file:// o content://), súbela primero al bucket
      if (urlImagenCedula && (urlImagenCedula.startsWith('file://') || urlImagenCedula.startsWith('content://'))) {
        urlImagenCedula = await subirImagenASupabase(urlImagenCedula, 'cedulas');
      }

      // 2. Preparamos el payload limpio enviando SOLO la URL de la imagen, no el archivo pesado
      const payloadFinal = {
        ...formData,
        foto_cedula: urlImagenCedula, // Reemplazamos la ruta local por la URL pública del Storage
      };

      // 3. Consumimos nuestro backend Express (que ahora recibirá un JSON ligero)
      await registrarUsuario(payloadFinal);

      Alert.alert('¡Registro Exitoso!', 'Tu cuenta ha sido creada y está pendiente de aprobación.', [
        {
          text: 'Aceptar',
          onPress: () => {
            setFormData(initialState);
            if (onSuccess) onSuccess();
            else if (onBack) onBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error de Registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return e(
    Modal,
    {
      visible: visible,
      animationType: 'fade',
      transparent: true,
      onRequestClose: onBack,
    },
    // Overlay oscuro traslúcido
    e(
      View,
      { style: styles.overlay },
      
      // Contenedor principal estilo Ventana / Card
      e(
        View,
        { style: styles.modalCard },
        
        // Cabecera con botón de cerrar
        e(
          View,
          { style: styles.header },
          e(
            View,
            null,
            e(Text, { style: styles.title }, 'Crear Cuenta'),
            e(Text, { style: styles.subtitle }, 'Completa tus datos para registrarte')
          ),
          e(
            TouchableOpacity,
            { style: styles.closeButton, onPress: onBack },
            e(Ionicons, { name: 'close', size: 22, color: '#64748B' })
          )
        ),

        // ScrollView interno para soportar todos los campos sin desbordar la pantalla
        e(
          ScrollView,
          { showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollContent },

          // --- SECCIÓN 1: DATOS DE CUENTA ---
          e(Text, { style: styles.sectionTitle }, 'Datos de la Cuenta'),
          e(
            View,
            { style: styles.fieldFull },
            e(Text, { style: styles.label }, 'Correo Electrónico *'),
            e(TextInput, {
              style: styles.input,
              placeholder: 'ejemplo@correo.com',
              placeholderTextColor: '#9EA5B1',
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              value: formData.email,
              onChangeText: (val) => handleChange('email', val),
            })
          ),
          e(
            View,
            { style: styles.fieldFull },
            e(Text, { style: styles.label }, 'Contraseña *'),
            e(TextInput, {
              style: styles.input,
              placeholder: '********',
              placeholderTextColor: '#9EA5B1',
              secureTextEntry: true,
              value: formData.contrasena,
              onChangeText: (val) => handleChange('contrasena', val),
            })
          ),

          // --- SECCIÓN 2: INFORMACIÓN PERSONAL ---
          e(Text, { style: styles.sectionTitle }, 'Información Personal'),
          e(
            View,
            { style: styles.row },
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'Primer Nombre *'),
              e(TextInput, {
                style: styles.input,
                placeholder: 'Ej. Juan',
                placeholderTextColor: '#9EA5B1',
                value: formData.nombre1,
                onChangeText: (val) => handleChange('nombre1', val),
              })
            ),
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'Segundo Nombre'),
              e(TextInput, {
                style: styles.input,
                placeholder: 'Ej. Carlos',
                placeholderTextColor: '#9EA5B1',
                value: formData.nombre2,
                onChangeText: (val) => handleChange('nombre2', val),
              })
            )
          ),
          e(
            View,
            { style: styles.row },
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'Primer Apellido *'),
              e(TextInput, {
                style: styles.input,
                placeholder: 'Ej. Pérez',
                placeholderTextColor: '#9EA5B1',
                value: formData.apellido1,
                onChangeText: (val) => handleChange('apellido1', val),
              })
            ),
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'Segundo Apellido'),
              e(TextInput, {
                style: styles.input,
                placeholder: 'Ej. Gómez',
                placeholderTextColor: '#9EA5B1',
                value: formData.apellido2,
                onChangeText: (val) => handleChange('apellido2', val),
              })
            )
          ),
          e(
            View,
            { style: styles.row },
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'Cédula *'),
              e(TextInput, {
                style: styles.input,
                placeholder: '001-000000-0000X',
                placeholderTextColor: '#9EA5B1',
                value: formData.cedula,
                onChangeText: (val) => handleChange('cedula', val),
              })
            ),
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'Teléfono'),
              e(TextInput, {
                style: styles.input,
                placeholder: '88888888',
                placeholderTextColor: '#9EA5B1',
                keyboardType: 'phone-pad',
                value: formData.telefono,
                onChangeText: (val) => handleChange('telefono', val),
              })
            )
          ),
          e(
            View,
            { style: styles.fieldFull },
            e(Text, { style: styles.label }, 'Dirección Residencial'),
            e(TextInput, {
              style: styles.input,
              placeholder: 'Managua, Nicaragua',
              placeholderTextColor: '#9EA5B1',
              value: formData.direccion,
              onChangeText: (val) => handleChange('direccion', val),
            })
          ),

          // --- SECCIÓN 3: CONDUCCIÓN ---
          e(Text, { style: styles.sectionTitle }, 'Licencia de Conducir'),
          e(
            View,
            { style: styles.row },
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'N° Licencia'),
              e(TextInput, {
                style: styles.input,
                placeholder: '12345678',
                placeholderTextColor: '#9EA5B1',
                value: formData.licencia,
                onChangeText: (val) => handleChange('licencia', val),
              })
            ),
            e(
              View,
              { style: styles.fieldHalf },
              e(Text, { style: styles.label }, 'Tipo Licencia'),
              e(TextInput, {
                style: styles.input,
                placeholder: 'Cat. 3',
                placeholderTextColor: '#9EA5B1',
                value: formData.tipo_licencia,
                onChangeText: (val) => handleChange('tipo_licencia', val),
              })
            )
          ),

          // --- SECCIÓN 4: ADJUNTOS / IMÁGENES ---
          e(Text, { style: styles.sectionTitle }, 'Documentos de Identificación'),
          
          // Selector de Foto Avatar
          e(
            View,
            { style: styles.imagePickerBox },
            e(Text, { style: styles.label }, 'Foto de Perfil (Avatar)'),
            e(
              TouchableOpacity,
              {
                style: styles.imageUploadButton,
                onPress: () => handlePickImage('url_avatar'),
                disabled: loadingImage === 'url_avatar',
              },
              loadingImage === 'url_avatar'
                ? e(ActivityIndicator, { color: '#2563EB' })
                : formData.url_avatar
                ? e(Image, { source: { uri: formData.url_avatar }, style: styles.previewImage })
                : e(
                    View,
                    { style: styles.uploadPlaceholder },
                    e(Ionicons, { name: 'camera-outline', size: 24, color: '#64748B' }),
                    e(Text, { style: styles.uploadText }, 'Subir Avatar Comprimido')
                  )
            )
          ),

          // Selector de Foto Cédula
          e(
            View,
            { style: styles.imagePickerBox },
            e(Text, { style: styles.label }, 'Foto de Cédula (Frontal)'),
            e(
              TouchableOpacity,
              {
                style: styles.imageUploadButton,
                onPress: () => handlePickImage('url_cedula'),
                disabled: loadingImage === 'url_cedula',
              },
              loadingImage === 'url_cedula'
                ? e(ActivityIndicator, { color: '#2563EB' })
                : formData.url_cedula
                ? e(Image, { source: { uri: formData.url_cedula }, style: styles.previewImage })
                : e(
                    View,
                    { style: styles.uploadPlaceholder },
                    e(Ionicons, { name: 'card-outline', size: 24, color: '#64748B' }),
                    e(Text, { style: styles.uploadText }, 'Subir Cédula Comprimida')
                  )
            )
          ),

          // BOTÓN PRINCIPAL
          e(
            TouchableOpacity,
            {
              style: [styles.submitButton, loading && styles.submitButtonDisabled],
              activeOpacity: 0.8,
              disabled: loading,
              onPress: handleRegister,
            },
            loading
              ? e(ActivityIndicator, { color: '#FFFFFF' })
              : e(Text, { style: styles.submitButtonText }, 'Completar Registro')
          )
        )
      )
    )
  );
}